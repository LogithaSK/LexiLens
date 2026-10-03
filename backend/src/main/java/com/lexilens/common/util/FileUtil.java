package com.lexilens.common.util;

import java.util.Set;

public class FileUtil {

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "image/png",
            "image/jpeg"
    );

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "pdf", "docx", "png", "jpg", "jpeg"
    );

    public static boolean isAllowedType(String contentType, String filename) {
        if (contentType != null && ALLOWED_TYPES.contains(contentType)) {
            return true;
        }
        if (filename != null) {
            String ext = getExtension(filename).toLowerCase();
            return ALLOWED_EXTENSIONS.contains(ext);
        }
        return false;
    }

    public static String getExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex >= 0) {
            return filename.substring(dotIndex + 1);
        }
        return "";
    }

    public static String getMimeType(String filename) {
        String ext = getExtension(filename).toLowerCase();
        return switch (ext) {
            case "pdf" -> "application/pdf";
            case "docx" -> "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            case "png" -> "image/png";
            case "jpg", "jpeg" -> "image/jpeg";
            default -> "application/octet-stream";
        };
    }
}
