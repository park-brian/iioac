package gov.epa;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class DataAccessTest {
    Connection connection;

    @org.junit.jupiter.api.BeforeAll
    void setUp() throws ClassNotFoundException, SQLException {
        Class.forName("net.ucanaccess.jdbc.UcanaccessDriver");
        String connectionUrl = "jdbc:ucanaccess://src/main/resources/iioac.mdb";
        this.connection = DriverManager.getConnection(connectionUrl);
    }

    @org.junit.jupiter.api.AfterAll
    void tearDown() throws SQLException {
        this.connection.close();
    }

    @Test
    void getStatus() throws SQLException {
        boolean status = DataAccess.getStatus(connection);
        assertTrue(status);
    }

    @Test
    void getOptions() throws SQLException {
        Map<String, List<String>> results = DataAccess.getOptions(connection);

        // assert results are not empty
        assertNotNull(results);
        assertNotNull(results.get("AssessID"));
        assertNotNull(results.get("AssOpID"));
        assertNotNull(results.get("ActSort"));
        assertNotNull(results.get("DualID"));

        assertNotEquals(0, results.get("AssessID").size());
        assertNotEquals(0, results.get("AssOpID").size());
        assertNotEquals(0, results.get("ActSort").size());
        assertNotEquals(0, results.get("DualID").size());
    }

    @Test
    void getResults() throws SQLException {
        Map<String, String[]> params = new HashMap<>();
        params.put("AssessID", new String[]{"1"});
        params.put("AssOpID", new String[]{"0"});
        params.put("ActSort", new String[]{"0"});
        params.put("DualID", new String[]{"1"});

        List<Map<String, Object>> results = DataAccess.getResults(params, connection);

        // assert results are not empty
        assertNotNull(results);
        assertNotEquals(0, results.size());

        // assert first result is correct
        assertEquals(1, results.get(0).get("AssessID"));
        assertEquals(0, results.get(0).get("AssOpID"));
        assertEquals(0, results.get(0).get("ActSort"));
        assertEquals(1, results.get(0).get("DualID"));
    }
}