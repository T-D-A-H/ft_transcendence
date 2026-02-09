FROM docker.elastic.co/logstash/logstash:7.17.16

COPY pipeline/ /usr/share/logstash/pipeline/
COPY config/ /usr/share/logstash/config/

EXPOSE 5069

CMD ["logstash", "-f", "/usr/share/logstash/pipeline/logstash.conf"]
