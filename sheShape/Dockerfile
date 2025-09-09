# Multi-stage layered Docker build using Bellsoft Liberica JDK
FROM bellsoft/liberica-openjre-debian:21-cds AS builder

LABEL maintainer="sheshape-team"
LABEL description="SheShape Fitness Application"
LABEL version="1.0"

WORKDIR /builder

ARG JAR_FILE=target/*.jar
COPY ${JAR_FILE} application.jar
RUN java -Djarmode=tools -jar application.jar extract --layers --destination extracted

FROM bellsoft/liberica-openjre-debian:21-cds

WORKDIR /application

COPY --from=builder /builder/extracted/dependencies/ ./
COPY --from=builder /builder/extracted/spring-boot-loader/ ./
COPY --from=builder /builder/extracted/snapshot-dependencies/ ./
COPY --from=builder /builder/extracted/application/ ./


EXPOSE 8080

ENTRYPOINT ["java", "-jar", "application.jar"]