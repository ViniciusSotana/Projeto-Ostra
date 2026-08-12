package dev.ostra.projetoostra.sale.jewelrycaseitem;

import dev.ostra.projetoostra.catalog.jewelry.Jewelry;
import dev.ostra.projetoostra.sale.jewelrycase.JewelryCase;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "jewelry_case_items")
@Getter
@Setter
@NoArgsConstructor
public class JewelryCaseItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "jewelry_case_id", nullable = false)
    private JewelryCase jewelryCase;

    @ManyToOne
    @JoinColumn(name = "jewelry_id", nullable = false)
    private Jewelry jewelry;

    @Column(nullable = false)
    private Integer quantity;

    public JewelryCaseItem(Jewelry jewelry, Integer quantity) {
        this.jewelry = jewelry;
        this.quantity = quantity;
    }
}