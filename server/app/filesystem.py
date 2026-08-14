import os

from fastapi import HTTPException

from app.schemas import genericResponse

def check_file_exists(path: str) -> genericResponse:
    try:
        result = os.path.exists(path)
        return genericResponse(
            outcome=str(result),
            state=200,
            message=None
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        return genericResponse(
            outcome="",
            state=500,
            message=str(e)
        )

def list_files(path: str, filter: str | None = None) -> genericResponse:
    try:
        if (check_file_exists(path)):
            dir_list = sorted(os.listdir(path))
            if filter:
                filtered_list = []
                for item in dir_list:
                    if filter in item:
                        filtered_list.append(item)
                dir_list = filtered_list
        else:
            dir_list = []
        return genericResponse(
            outcome=dir_list,
            state=200,
            message=None
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        return genericResponse(
            outcome="",
            state=500,
            message=str(e)
        )
