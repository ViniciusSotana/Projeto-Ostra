package dev.ostra.projetoostra.sale.jewelrycase;

import dev.ostra.projetoostra.people.seller.Seller;
import dev.ostra.projetoostra.sale.jewelrycaseitem.JewelryCaseItem;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "jewelry_cases")
@Getter
@Setter
@NoArgsConstructor
public class JewelryCase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String code;

    private String description;

    @OneToOne
    @JoinColumn(name = "seller_id", unique = true)
    private Seller seller;

    @OneToMany(mappedBy = "jewelryCase", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<JewelryCaseItem> items = new java.util.ArrayList<>();

    public JewelryCase(String code, String description, Seller seller) {
        this.code = code;
        this.description = description;
        this.seller = seller;
    }

    public void addItem(JewelryCaseItem item) {
        items.add(item);
        item.setJewelryCase(this);
    }
}