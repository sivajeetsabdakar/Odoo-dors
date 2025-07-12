# Use OpenJDK 17 as base image
FROM openjdk:17-jdk-slim

# Set working directory
WORKDIR /app

# Copy the Gradle wrapper and build files
COPY backend/gradlew .
COPY backend/gradle gradle
COPY backend/build.gradle .
COPY backend/settings.gradle .

# Make gradlew executable
RUN chmod +x ./gradlew

# Download dependencies
RUN ./gradlew dependencies --no-daemon

# Copy source code
COPY backend/src src

# Build the application
RUN ./gradlew build -x test --no-daemon

# Expose port
EXPOSE 8080

# Run the application
CMD ["java", "-jar", "build/libs/backend-0.0.1-SNAPSHOT.jar"] 