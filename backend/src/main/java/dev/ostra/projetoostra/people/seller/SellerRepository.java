package dev.ostra.projetoostra.people.seller;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface SellerRepository extends JpaRepository<Seller, UUID> {

    long countByIsActiveTrue();

}