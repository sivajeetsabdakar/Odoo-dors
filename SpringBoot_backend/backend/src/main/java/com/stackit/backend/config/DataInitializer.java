package com.stackit.backend.config;

import com.stackit.backend.entity.Tag;
import com.stackit.backend.entity.User;
import com.stackit.backend.repository.TagRepository;
import com.stackit.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private TagRepository tagRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        initializeTags();
        initializeAdminUser();
    }

    private void initializeTags() {
        if (tagRepository.count() == 0) {
            List<Tag> defaultTags = Arrays.asList(
                    createTag("java", "Java programming language", "#b07219"),
                    createTag("spring-boot", "Spring Boot framework", "#6db33f"),
                    createTag("react", "React.js library", "#61dafb"),
                    createTag("javascript", "JavaScript programming language", "#f7df1e"),
                    createTag("python", "Python programming language", "#3776ab"),
                    createTag("database", "Database related questions", "#336791"),
                    createTag("api", "API development and integration", "#ff6b6b"),
                    createTag("mobile", "Mobile development", "#4ecdc4"),
                    createTag("web", "Web development", "#45b7d1"),
                    createTag("devops", "DevOps and deployment", "#ff9ff3"));
            tagRepository.saveAll(defaultTags);
            System.out.println("✅ Default tags initialized");
        }
    }

    private void initializeAdminUser() {
        if (userRepository.count() == 0) {
            User adminUser = new User();
            adminUser.setUsername("admin");
            adminUser.setEmail("admin@stackit.com");
            adminUser.setPasswordHash(hashPassword("admin123"));
            adminUser.setRole(User.UserRole.ADMIN);
            userRepository.save(adminUser);
            System.out.println("✅ Admin user initialized (admin@stackit.com / admin123)");
        }
    }

    private Tag createTag(String name, String description, String color) {
        Tag tag = new Tag();
        tag.setName(name);
        tag.setDescription(description);
        tag.setColor(color);
        return tag;
    }

    private String hashPassword(String password) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(password.getBytes());
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1)
                    hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error hashing password", e);
        }
    }
}