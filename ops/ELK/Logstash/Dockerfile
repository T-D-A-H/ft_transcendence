FROM docker.elastic.co/logstash/logstash:7.17.16

WORKDIR /app

COPY pipeline/ ./pipeline/
COPY config/ ./config/

EXPOSE 5069

CMD ["logstash", "-f", "/app/pipeline/logstash.conf", "--path.settings", "/app/config"]