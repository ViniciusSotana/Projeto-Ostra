package dev.ostra.projetoostra.people.seller;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "sellers")
@Getter
@Setter
@NoArgsConstructor
public class Seller {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true)
    private String email;

    @Column(unique = true)
    private String cpf;

    @Column(nullable = false, unique = true)
    private String phone;

    @Column(nullable = false)
    private BigDecimal commission = BigDecimal.ZERO;

    @Column(name = "commission_rate", nullable = false)
    private BigDecimal commissionRate = BigDecimal.ZERO;

    @Column(name = "sold_value", nullable = false)
    private BigDecimal soldValue = BigDecimal.ZERO;

    @Column(name = "is_active", nullable = false, columnDefinition = "boolean default true")
    private Boolean isActive = true;

    @Column(name = "sales_count", nullable = false, columnDefinition = "int default 0")
    private Integer salesCount = 0;

    public Seller(String name, String email, String cpf, String phone, BigDecimal commissionRate) {
        this.name = name;
        this.email = email;
        this.cpf = cpf;
        this.phone = phone;
        this.commissionRate = commissionRate;
        this.isActive = true;
        this.salesCount = 0;
    }

    public BigDecimal calcularComissao() {
        BigDecimal rate = this.commissionRate.divide(BigDecimal.valueOf(100));
        this.commission = this.soldValue.multiply(rate);
        return this.commission;
    }
}