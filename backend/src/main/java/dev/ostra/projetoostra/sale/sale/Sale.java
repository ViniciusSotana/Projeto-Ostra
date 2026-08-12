package dev.ostra.projetoostra.sale.sale;

import dev.ostra.projetoostra.people.client.Client;
import dev.ostra.projetoostra.people.seller.Seller;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "sales")
@Getter
@Setter
@NoArgsConstructor
public class Sale {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "sale_date", nullable = false)
    private LocalDateTime saleDate;

    @Column(name = "total_amount", nullable = false)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(nullable = false)
    private String status = "CONCLUIDA";

    @ManyToOne
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @ManyToOne
    @JoinColumn(name = "seller_id")
    private Seller seller;

    @OneToMany(mappedBy = "sale", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SaleItem> items = new ArrayList<>();

    public Sale(Client client, Seller seller) {
        this.client = client;
        this.seller = seller;
        this.saleDate = LocalDateTime.now();
    }

    public void addItem(SaleItem item) {
        items.add(item);
        item.setSale(this);
        this.totalAmount = this.totalAmount.add(item.getSubTotal());
    }
}