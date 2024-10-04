import requests


URL_PREFIX = "http://localhost:8888/v1"


def _validate(data, expected_data):
    def _recurrence_cmp(data, expected_data, err_path, err_desc):
        if isinstance(data, dict) and isinstance(expected_data, dict):
            for key in expected_data:
                if key not in data:
                    return False, err_path, f"Key {key} does not exists."
                ret, path, desc = _recurrence_cmp(data[key], expected_data[key], err_path + [key], err_desc)
                if not ret:
                    return False, path, desc
            return True, [], ""
        elif isinstance(data, list) and isinstance(expected_data, list):
            if len(data) != len(expected_data):
                return False, err_path, f"List length does not match. ({len(data)}!={len(expected_data)})"
            for i, item in enumerate(expected_data):
                ret, path, desc = _recurrence_cmp(data[i], item, err_path + [i], err_desc)
                if not ret:
                    return False, path, desc
            return True, [], ""
        else:
            if data == expected_data:
                return True, [], ""
            return False, err_path, f"Data does not match."
    return _recurrence_cmp(data, expected_data, err_path=[], err_desc="")


class TestStep:
    def __init__(self, method:str, url:str, body:(list or dict)=None, desc:str="", expected_status_code:int=200, expected_response_data:(list or dict)=None):
        self.method = method
        self.url = url
        self.body = body
        self.desc = desc
        self.expected_status_code = expected_status_code
        self.expected_response_data = expected_response_data
    
    def run(self, step_idx:int=None) -> None:
        self.send_request()
        self.validate()
        self.print(step_idx)
    
    def send_request(self) -> None:
        x = requests.request(self.method, URL_PREFIX + self.url, json=self.body)
        self.actual_status_code = x.status_code
        self.actual_response_data = x.json() if x.text != "" else None
    
    def validate(self) -> None:
        ret, self.err_path, self.err_desc = _validate(self.actual_response_data, self.expected_response_data)
        self.passed = self.actual_status_code == self.expected_status_code and ret

    def print(self, step_idx:int=None) -> None:
        symbol = "✅" if self.passed else "❌"
        if step_idx is not None:
            print(symbol, f"Step {step_idx}:", self.desc)
        else:
            print(symbol, "Step:", self.desc)
        if not self.passed:
            if self.actual_status_code != self.expected_status_code:
                print("\t-", "Error:", "Status code does not match.")
                print("\t-", "Actual:", self.actual_status_code)
                print("\t-", "Expected:", self.expected_status_code)
                print()
            print("\t-", "Error:", self.err_desc)
            print("\t-", "Path:", self.err_path)
            actual = self.actual_response_data
            expected = self.expected_response_data
            for p in self.err_path:
                actual = actual[p]
                expected = expected[p]
            print("\t-", "Actual:", actual)
            print("\t-", "Expected:", expected)
                

    @classmethod
    def get(cls, url:str, desc:str="", expected_status_code:int=200, expected_response_data:(list or dict)=None):
        return cls(method="get", url=url, desc=desc, expected_status_code=expected_status_code, expected_response_data=expected_response_data)
    
    @classmethod
    def post(cls, url:str, body:(list or dict)=None, desc:str="", expected_status_code:int=200, expected_response_data:(list or dict)=None):
        return cls(method="post", url=url, body=body, desc=desc, expected_status_code=expected_status_code, expected_response_data=expected_response_data)
    
    @classmethod
    def put(cls, url:str, body:(list or dict)=None, desc:str="", expected_status_code:int=200, expected_response_data:(list or dict)=None):
        return cls(method="put", url=url, body=body, desc=desc, expected_status_code=expected_status_code, expected_response_data=expected_response_data)
    
    @classmethod
    def delete(cls, url:str, desc:str="", expected_status_code:int=200, expected_response_data:(list or dict)=None):
        return cls(method="delete", url=url, desc=desc, expected_status_code=expected_status_code, expected_response_data=expected_response_data)
    

class Testcase:
    count = 1

    def __init__(self, steps:list=[], desc:str=""):
        self.steps = steps
        self.desc = desc
        self.steps = []
    
    def add_step(self, step:TestStep):
        self.steps.append(step)

    def run(self, clean=True) -> None:
        print("Testcase", Testcase.count)
        if clean:
            TestStep.delete("/tests/destroy", "Init database...", 200, None).run(0)
        for idx, step in enumerate(self.steps):
            step.run(idx + 1)
            if not step.passed:
                break
        Testcase.count += 1

