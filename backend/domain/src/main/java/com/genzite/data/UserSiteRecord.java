package com.genzite.data;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.UUID;

@Entity
@Table(name = "user_site_record")
public class UserSiteRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "site_id", nullable = false)
    private String siteId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "record_data", columnDefinition = "jsonb", nullable = false)
    private JsonNode recordData;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getSiteId() {
        return siteId;
    }

    public void setSiteId(String siteId) {
        this.siteId = siteId;
    }

    public JsonNode getRecordData() {
        return recordData;
    }

    public void setRecordData(JsonNode recordData) {
        this.recordData = recordData;
    }
}
