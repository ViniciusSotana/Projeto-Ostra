package dev.ostra.projetoostra.catalog.jewelry;

import dev.ostra.projetoostra.catalog.collection.JewelryCollection;
import dev.ostra.projetoostra.catalog.jewelrytype.JewelryType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "jewelries")
@Getter
@Setter
@NoArgsConstructor
public class Jewelry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String sku;

    private String description;

    @Column(name = "original_price", nullable = false)
    private BigDecimal originalPrice;

    @Column(name = "selling_price", nullable = false)
    private BigDecimal sellingPrice;

    @Column(name = "discount_value")
    private BigDecimal discountValue = BigDecimal.ZERO;

    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity = 0;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "image_public_id")
    private String imagePublicId;

    @ManyToOne
    @JoinColumn(name = "jewelry_type_id", nullable = false)
    private JewelryType type;

    @ManyToOne
    @JoinColumn(name = "jewelry_collection_id")
    private JewelryCollection collection;

    public Jewelry(String name, String sku, String description, BigDecimal originalPrice, BigDecimal sellingPrice, Integer stockQuantity, String imageUrl, String imagePublicId, JewelryType type, JewelryCollection collection) {
        this.name = name;
        this.sku = sku;
        this.description = description;
        this.originalPrice = originalPrice;
        this.sellingPrice = sellingPrice;
        this.stockQuantity = stockQuantity;
        this.imageUrl = imageUrl;
        this.imagePublicId = imagePublicId;
        this.type = type;
        this.collection = collection;
    }

    public void atualizarEstoque(int qtd) {
        if (this.stockQuantity < qtd) {
            throw new RuntimeException("Estoque insuficiente para a joia: " + this.name);
        }
        this.stockQuantity -= qtd;
    }
}