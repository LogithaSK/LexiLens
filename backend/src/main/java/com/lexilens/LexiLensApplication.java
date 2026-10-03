package com.lexilens;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class LexiLensApplication {
    public static void main(String[] args) {
        SpringApplication.run(LexiLensApplication.class, args);
    }
}
