import os
import re
import importlib


if __name__ == "__main__":
    try:
        filenames = os.listdir("testcases")
        pattern = r"^testcase(\d*)\.py$"
        testcase_indexes = [int(re.search(pattern, f).group(1)) for f in filenames if re.search(pattern, f)]

        for testcase_index in sorted(testcase_indexes):
            testcase = importlib.import_module(f"testcases.testcase{testcase_index}")
            if hasattr(testcase, "run"):
                testcase.run()
    except ModuleNotFoundError:
        print(f"Module does not exist.")
    # except Exception as e:
    #     print(e)
