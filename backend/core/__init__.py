import pymysql

# Patch version to satisfy Django's mysqlclient >= 2.2.1 version check
pymysql.version_info = (2, 2, 1, "final", 0)
pymysql.__version__ = "2.2.1"

pymysql.install_as_MySQLdb()
