import uvicorn


def main() -> None:
    uvicorn.run("better_map.api.app:app", host="127.0.0.1", port=8112, reload=True)


if __name__ == "__main__":
    main()
