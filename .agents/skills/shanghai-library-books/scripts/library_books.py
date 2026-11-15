#!/usr/bin/env python3
"""上海市图书馆书籍管理系统 API 客户端

基于 PT010 后端 REST API 的命令行工具，仅使用 Python 标准库。

用法示例:
    python library_books.py list --page 1 --page-size 5
    python library_books.py list --book-name 丝路 --category 历史
    python library_books.py get 1
    python library_books.py create --book-name 测试书 --call-number Z123/1 --category 测试
    python library_books.py update 1 --douban-score 8.5 --borrow-status Y
    python library_books.py delete 1
    python library_books.py categories
    python library_books.py sub-categories

环境变量:
    SHANGHAI_LIBRARY_API_BASE  API 基础地址，默认 https://shanghai-library.simplechen.xyz
"""
import argparse
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request

DEFAULT_BASE = "https://shanghai-library.simplechen.xyz"
TIMEOUT = 20

# Windows 默认控制台编码为 GBK，统一改为 UTF-8 避免中文输出乱码
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

# 允许出现在 create/update 请求体中的字段及其取值约束
VALID_YN = {"Y", "N"}


def fail(msg: str) -> None:
    print(json.dumps({"code": -1, "message": msg}, ensure_ascii=False))
    sys.exit(1)


def base_url() -> str:
    return os.environ.get("SHANGHAI_LIBRARY_API_BASE", DEFAULT_BASE).rstrip("/")


def request(method: str, path: str, query: dict = None, body: dict = None) -> dict:
    """发送 HTTP 请求并返回解析后的 JSON（统一信封 {code, message, data}）"""
    url = base_url() + path
    if query:
        url += "?" + urllib.parse.urlencode(query)

    data = None
    # 站点 WAF 会拦截 Python 默认 User-Agent，必须伪装成浏览器
    headers = {"Accept": "application/json", "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"}
    if body is not None:
        data = json.dumps(body, ensure_ascii=False).encode("utf-8")
        headers["Content-Type"] = "application/json"

    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
            payload = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8", errors="replace")
        try:
            detail = json.loads(detail)
            # FastAPI 422 会返回 detail 数组，404 返回字符串
            if isinstance(detail, dict) and "detail" in detail:
                detail = detail["detail"]
        except (json.JSONDecodeError, ValueError):
            pass
        fail(f"HTTP {e.code}: {detail}")
    except urllib.error.URLError as e:
        fail(f"无法连接 API（{e.reason}），请检查网络或服务是否运行")

    if not isinstance(payload, dict) or "code" not in payload:
        fail(f"意外的响应格式: {payload!r}")
    if payload.get("code") != 0:
        fail(f"业务错误 code={payload.get('code')}: {payload.get('message')}")
    return payload


def cmd_list(args):
    query = {"page": args.page, "page_size": args.page_size}
    if args.book_name:
        query["book_name"] = args.book_name
    if args.score_min is not None:
        query["douban_score_min"] = args.score_min
    if args.score_max is not None:
        query["douban_score_max"] = args.score_max
    for param in ("normal_loan", "reference_loan", "wechat_read", "borrow_status"):
        value = getattr(args, param)
        if value:
            query[param] = value
    if args.level is not None:
        query["level"] = args.level

    payload = request("GET", "/api/books", query=query)
    data = payload["data"]
    out = {
        "total": data["total"],
        "page": data["page"],
        "page_size": data["page_size"],
        "list": data["list"],
    }
    print(json.dumps(out, ensure_ascii=False, indent=2))


def cmd_get(args):
    payload = request("GET", f"/api/books/{args.book_id}")
    print(json.dumps(payload["data"], ensure_ascii=False, indent=2))


def build_book_body(args, for_create: bool) -> dict:
    """从命令行参数构造请求体；update 时只包含用户显式给出的字段"""
    body = {}
    if for_create or args.book_name is not None:
        if not args.book_name:
            fail("book_name 必填（最长 255 字符）")
        body["book_name"] = args.book_name
    if for_create or args.call_number is not None:
        if not args.call_number:
            fail("call_number 必填（最长 200 字符）")
        body["call_number"] = args.call_number

    optional = [
        ("isbn", args.isbn),
        ("category", args.category),
        ("sub_category", args.sub_category),
        ("remark", args.remark),
    ]
    for key, value in optional:
        if for_create or value is not None:
            body[key] = value

    if args.douban_score is not None:
        if not (0 <= args.douban_score <= 10):
            fail("douban_score 取值范围 0-10")
        body["douban_score"] = args.douban_score
    if args.level is not None:
        body["level"] = args.level

    for key in ("normal_loan", "reference_loan", "wechat_read", "borrow_status"):
        value = getattr(args, key)
        if value is None:
            # 后端对 Y/N 字段默认 N，create 时缺省也按 N 处理
            if for_create:
                body[key] = "N"
            continue
        if value not in VALID_YN:
            fail(f"{key} 只能是 Y 或 N，收到: {value}")
        body[key] = value
    return body


def cmd_create(args):
    body = build_book_body(args, for_create=True)
    payload = request("POST", "/api/books", body=body)
    print(json.dumps(payload["data"], ensure_ascii=False))


def cmd_update(args):
    body = build_book_body(args, for_create=False)
    if not body:
        fail("未提供任何要更新的字段")
    payload = request("PUT", f"/api/books/{args.book_id}", body=body)
    print(json.dumps(payload["data"], ensure_ascii=False))


def cmd_delete(args):
    payload = request("DELETE", f"/api/books/{args.book_id}")
    print(json.dumps({"deleted": args.book_id, "message": payload["message"]}, ensure_ascii=False))


def cmd_categories(args):
    payload = request("GET", "/api/books/categories")
    print(json.dumps(payload["data"], ensure_ascii=False))


def cmd_sub_categories(args):
    payload = request("GET", "/api/books/sub-categories")
    print(json.dumps(payload["data"], ensure_ascii=False))


def add_book_fields(parser, for_create: bool):
    """为 create/update 添加书籍字段参数"""
    parser.add_argument("--book-name", help="书名（必填，最长 255 字符）")
    parser.add_argument("--call-number", help="索书号（必填，最长 200 字符）")
    parser.add_argument("--isbn", help="ISBN（可选，最长 50 字符）")
    parser.add_argument("--douban-score", type=float, help="豆瓣评分 0-10")
    parser.add_argument("--category", help="类别（最长 100 字符）")
    parser.add_argument("--sub-category", help="小类别（最长 100 字符）")
    parser.add_argument("--level", type=int, help="等级")
    parser.add_argument("--remark", help="备注")
    parser.add_argument("--normal-loan", choices=["Y", "N"], help="普通外借")
    parser.add_argument("--reference-loan", choices=["Y", "N"], help="参考外借")
    parser.add_argument("--wechat-read", choices=["Y", "N"], help="微信读书")
    parser.add_argument("--borrow-status", choices=["Y", "N"], help="借阅状态（Y=已读，N=未读）")


def main():
    parser = argparse.ArgumentParser(description="上海市图书馆书籍管理 API 客户端")
    sub = parser.add_subparsers(dest="command", required=True)

    p_list = sub.add_parser("list", help="分页查询书籍列表")
    p_list.add_argument("--book-name", help="书名模糊查询")
    p_list.add_argument("--score-min", type=float, help="豆瓣评分最小值（含）")
    p_list.add_argument("--score-max", type=float, help="豆瓣评分最大值（含）")
    p_list.add_argument("--normal-loan", choices=["Y", "N"])
    p_list.add_argument("--reference-loan", choices=["Y", "N"])
    p_list.add_argument("--wechat-read", choices=["Y", "N"])
    p_list.add_argument("--borrow-status", choices=["Y", "N"])
    p_list.add_argument("--category", help="类别精确匹配")
    p_list.add_argument("--sub-category", help="小类别精确匹配")
    p_list.add_argument("--level", type=int)
    p_list.add_argument("--page", type=int, default=1)
    p_list.add_argument("--page-size", type=int, default=20)
    p_list.set_defaults(func=cmd_list)

    p_get = sub.add_parser("get", help="查询单本完整信息")
    p_get.add_argument("book_id", type=int)
    p_get.set_defaults(func=cmd_get)

    p_create = sub.add_parser("create", help="新增书籍")
    add_book_fields(p_create, for_create=True)
    p_create.set_defaults(func=cmd_create)

    p_update = sub.add_parser("update", help="更新书籍（只传需要修改的字段）")
    p_update.add_argument("book_id", type=int)
    add_book_fields(p_update, for_create=False)
    p_update.set_defaults(func=cmd_update)

    p_delete = sub.add_parser("delete", help="删除书籍（逻辑删除）")
    p_delete.add_argument("book_id", type=int)
    p_delete.set_defaults(func=cmd_delete)

    sub.add_parser("categories", help="列出全部类别").set_defaults(func=cmd_categories)
    sub.add_parser("sub-categories", help="列出全部小类别").set_defaults(func=cmd_sub_categories)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
