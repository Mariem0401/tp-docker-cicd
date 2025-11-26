FROM mysql:8.0

ENV MYSQL_ROOT_PASSWORD=root
ENV MYSQL_DATABASE=mydb

COPY sql.init /docker-entrypoint-initdb.d/
