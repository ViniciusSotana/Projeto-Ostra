package dev.ostra.projetoostra.sale.sale;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SaleRepository extends JpaRepository<Sale, UUID> {

    List<Sale> findByStatusNot(String status);

}