package dev.ostra.projetoostra.security;

import dev.ostra.projetoostra.security.user.User;
import dev.ostra.projetoostra.security.user.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class UserDataInitializer {

    @Bean
    public CommandLineRunner loadAdminUser(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.count() == 0) {

                String encryptedPassword = passwordEncoder.encode("admin");

                User admin = new User(
                        "Administradora",
                        "admin@admin.com",
                        encryptedPassword
                );

                userRepository.save(admin);
                System.out.println("Usuário administrador padrão criado com senha criptografada!");
            }
        };
    }
}