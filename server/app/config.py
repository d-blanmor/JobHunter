import configparser

config = configparser.ConfigParser()
config.read("config.ini")

def conf_pathname() -> str:
    return config.get('api', 'pathname');

def conf_dbtype() -> str:
    return config.get('data', 'type');

def conf_db() -> str:
    return config.get('data', 'db');