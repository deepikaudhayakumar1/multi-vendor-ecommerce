package com.examly.springapp.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path uploadDir = Paths.get("uploads");

    public FileStorageService() {

        try {

            Files.createDirectories(uploadDir);

        } catch (IOException e) {

            throw new RuntimeException(
                    "Could not create upload directory",
                    e
            );
        }
    }

    public String storeFile(MultipartFile file) {

        // -----------------------------------------
        // Validate file
        // -----------------------------------------

        if (file == null || file.isEmpty()) {

            throw new RuntimeException(
                    "Product image is required"
            );
        }

        // -----------------------------------------
        // Validate image type
        // -----------------------------------------

        String contentType = file.getContentType();

        if (contentType == null ||
                !contentType.startsWith("image/")) {

            throw new RuntimeException(
                    "Only image files are allowed"
            );
        }

        // -----------------------------------------
        // Get extension
        // -----------------------------------------

        String originalName =
                file.getOriginalFilename();

        String extension = "";

        if (originalName != null &&
                originalName.contains(".")) {

            extension =
                    originalName.substring(
                            originalName.lastIndexOf(".")
                    );
        }

        // -----------------------------------------
        // Generate unique filename
        // -----------------------------------------

        String fileName =
                UUID.randomUUID() + extension;

        // -----------------------------------------
        // Save file
        // -----------------------------------------

        try {

            Path targetLocation =
                    uploadDir.resolve(fileName);

            Files.copy(
                    file.getInputStream(),
                    targetLocation,
                    StandardCopyOption.REPLACE_EXISTING
            );

            // This value will be stored in DB
            return "/uploads/" + fileName;

        } catch (IOException e) {

            throw new RuntimeException(
                    "Could not store product image",
                    e
            );
        }
    }
}