package dev.ostra.projetoostra.catalog.jewelry;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/jewelries")
public class JewelryController {

    private final JewelryService service;

    public JewelryController(JewelryService service) {
        this.service = service;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<JewelryResponseDTO> create(
            @RequestPart("data") @Valid JewelryRequestDTO request,
            @RequestPart("image") MultipartFile image) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request, image));
    }

    @GetMapping
    public ResponseEntity<List<JewelryResponseDTO>> findAll(
            @RequestParam(required = false) UUID typeId,
            @RequestParam(required = false) UUID collectionId,
            @RequestParam(required = false) Boolean isPromo
    ) {
        return ResponseEntity.ok(service.findAll(typeId, collectionId, isPromo));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JewelryResponseDTO> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<JewelryResponseDTO> update(
            @PathVariable UUID id,
            @RequestPart("data") @Valid JewelryRequestDTO request,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        return ResponseEntity.ok(service.update(id, request, image));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}