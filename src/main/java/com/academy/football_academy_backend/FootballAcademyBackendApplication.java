package com.academy.football_academy_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(exclude = {UserDetailsServiceAutoConfiguration.class})
@EnableScheduling
public class FootballAcademyBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(FootballAcademyBackendApplication.class, args);
	}

}
