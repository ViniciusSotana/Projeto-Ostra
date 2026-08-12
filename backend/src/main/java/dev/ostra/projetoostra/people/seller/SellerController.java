package dev.ostra.projetoostra.people.seller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/sellers")
public class SellerController {

    private final SellerService service;

    public SellerController(SellerService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<SellerResponseDTO> create(@RequestBody @Valid SellerRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @GetMapping
    public ResponseEntity<List<SellerResponseDTO>> findAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SellerResponseDTO> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SellerResponseDTO> update(@PathVariable UUID id, @RequestBody @Valid SellerRequestDTO request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<Void> payCommission(@PathVariable UUID id) {
        service.payCommission(id);
        return ResponseEntity.ok().build();
    }
}