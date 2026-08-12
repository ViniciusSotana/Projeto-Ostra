package dev.ostra.projetoostra.catalog.jewelry;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface JewelryRepository extends JpaRepository<Jewelry, UUID> {

    @Query("SELECT j FROM Jewelry j WHERE " +
            "(:typeId IS NULL OR j.type.id = :typeId) AND " +
            "(:collectionId IS NULL OR j.collection.id = :collectionId) AND " +
            "(:isPromo IS NULL OR :isPromo = false OR j.discountValue > 0)")
    List<Jewelry> searchJewelries(@Param("typeId") UUID typeId,
                                  @Param("collectionId") UUID collectionId,
                                  @Param("isPromo") Boolean isPromo);
}