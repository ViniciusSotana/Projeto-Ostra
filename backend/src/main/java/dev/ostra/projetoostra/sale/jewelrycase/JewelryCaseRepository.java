package dev.ostra.projetoostra.sale.jewelrycase;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface JewelryCaseRepository extends JpaRepository<JewelryCase, UUID> {

    Optional<JewelryCase> findBySellerId(UUID sellerId);

}