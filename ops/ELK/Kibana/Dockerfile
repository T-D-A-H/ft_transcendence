FROM docker.elastic.co/kibana/kibana:7.17.16

WORKDIR /app

COPY kibana.yml ./kibana.yml

EXPOSE 5601

CMD ["kibana", "--config", "/app/kibana.yml"]