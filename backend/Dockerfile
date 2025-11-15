# Multi-stage build for Spring Boot application
FROM gradle:8.14.3-jdk21 AS build

# Set working directory
WORKDIR /app

# Copy Gradle files first for caching
COPY build.gradle.kts settings.gradle.kts ./
COPY gradle ./gradle
COPY gradlew ./

# Download dependencies (cached layer)
RUN gradle dependencies --no-daemon || true

# Copy source code
COPY src ./src

# Build application (skip tests for faster build)
RUN gradle bootJar --no-daemon -x test

# Runtime stage - smaller image
FROM eclipse-temurin:21-jre-alpine

# Set working directory
WORKDIR /app

# Copy built jar from build stage
COPY --from=build /app/build/libs/*.jar app.jar

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# Run application
ENTRYPOINT ["java", "-jar", "app.jar"]

# Optional: Add JVM options for production
ENV JAVA_OPTS="-Xms512m -Xmx1024m -XX:+UseG1GC"
CMD java $JAVA_OPTS -jar app.jar
