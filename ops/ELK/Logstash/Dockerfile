FROM docker.elastic.co/logstash/logstash:8.11.0

COPY pipeline/ /usr/share/logstash/pipeline/
COPY config/ /usr/share/logstash/config/

EXPOSE 5069

CMD ["logstash", "-f", "/usr/share/logstash/pipeline/logstash.conf"]
