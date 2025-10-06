package com.academy.football_academy_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(exclude = {UserDetailsServiceAutoConfiguration.class})
@EnableScheduling
@ComponentScan(basePackages = {"com.academy.football_academy_backend"})
public class FootballAcademyBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(FootballAcademyBackendApplication.class, args);
	}

}
