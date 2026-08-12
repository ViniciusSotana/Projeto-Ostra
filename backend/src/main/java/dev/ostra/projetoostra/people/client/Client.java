package dev.ostra.projetoostra.people.client;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "clients")
@Getter
@Setter
@NoArgsConstructor
public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(unique = true)
    private String cpf;

    private String phone;

    private String address;

    @Column(name = "total_spent")
    private BigDecimal totalSpent = BigDecimal.ZERO;

    public Client(String name, String email, String cpf, String phone, String address) {
        this.name = name;
        this.email = email;
        this.cpf = cpf;
        this.phone = phone;
        this.address = address;
    }
}