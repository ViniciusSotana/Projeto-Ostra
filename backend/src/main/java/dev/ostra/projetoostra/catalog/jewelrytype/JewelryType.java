package dev.ostra.projetoostra.catalog.jewelrytype;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "jewelry_types")
@Getter
@Setter
@NoArgsConstructor
public class JewelryType {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String name;

    private String description;

    public JewelryType(String name, String description) {
        this.name = name;
        this.description = description;
    }
}