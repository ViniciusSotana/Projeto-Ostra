package dev.ostra.projetoostra.sale.sale;

import dev.ostra.projetoostra.catalog.jewelry.Jewelry;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "sale_items")
@Getter
@Setter
@NoArgsConstructor
public class SaleItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "sale_id", nullable = false)
    private Sale sale;

    @ManyToOne
    @JoinColumn(name = "jewelry_id", nullable = false)
    private Jewelry jewelry;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", nullable = false)
    private BigDecimal unitPrice;

    public SaleItem(Jewelry jewelry, Integer quantity, BigDecimal unitPrice) {
        this.jewelry = jewelry;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
    }

    public BigDecimal getSubTotal() {
        return this.unitPrice.multiply(BigDecimal.valueOf(this.quantity));
    }
}