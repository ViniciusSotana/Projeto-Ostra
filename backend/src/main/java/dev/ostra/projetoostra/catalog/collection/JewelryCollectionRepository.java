package dev.ostra.projetoostra.catalog.collection;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface JewelryCollectionRepository extends JpaRepository<JewelryCollection, UUID> {

    boolean existsByNameIgnoreCase(String name);

    Optional<JewelryCollection> findByNameIgnoreCase(String name);

}