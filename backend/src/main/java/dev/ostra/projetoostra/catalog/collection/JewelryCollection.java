package dev.ostra.projetoostra.catalog.collection;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "collections")
@Getter
@Setter
@NoArgsConstructor
public class JewelryCollection {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String name; // Ex: "Coleção Primavera", "Coleção Pérolas"

    private String description;

    @Column(name = "launch_date")
    private LocalDate launchDate; // Um campo extra que faz muito sentido para coleções!

    public JewelryCollection(String name, String description, LocalDate launchDate) {
        this.name = name;
        this.description = description;
        this.launchDate = launchDate;
    }
}