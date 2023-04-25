package gov.epa;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class DataAccess {

    public static boolean getStatus(Connection connection) throws SQLException {
        String sql = "SELECT 1 from Assessments limit 1";
        try(PreparedStatement statement = connection.prepareStatement(sql);
            ResultSet resultSet = statement.executeQuery()) {
                if (resultSet.next()) {
                    return resultSet.getString(1).equals("1");
                }
                return false;
            }
    }

    public static Map<String, List<String>> getOptions(Connection connection) throws SQLException {
        String assessOptionsSql = "SELECT DISTINCT AssessID FROM IrerRels where AssessID is not null";
        String assOpOptionsSql = "SELECT DISTINCT AssOpID FROM IrerRels where AssOpID is not null";
        String actSortOptionsSql = "SELECT DISTINCT ActSort FROM IrerRels where ActSort is not null";
        String dualIDOptionsSql = "SELECT DISTINCT DualID FROM IrerRels where DualID is not null";

        Map<String, List<String>> options = new HashMap<>();
        options.put("AssessID", getValues(connection, assessOptionsSql));
        options.put("AssOpID", getValues(connection, assOpOptionsSql));
        options.put("ActSort", getValues(connection, actSortOptionsSql));
        options.put("DualID", getValues(connection, dualIDOptionsSql));
        return options;
    }

    public static List<Map<String, Object>> getResults(Map<String, String[]> parameters, Connection connection) throws SQLException {
        String sql = "SELECT " +
                "r.*, " +
                "'P-' & a.FiscalYear  & '-' & a.EPAIDNumber AS PMN " +
                "FROM IrerRels r JOIN Assessments a ON r.AssessID = a.AssessID WHERE " +
                "(? = '' OR ? = CStr(r.AssessID)) AND" +
                "(? = '' OR ? = CStr(r.AssOpID)) AND" +
                "(? = '' OR ? = CStr(r.ActSort)) AND" +
                "(? = '' OR ? = CStr(r.DualID)) AND " +
                "Media != 'RELEASE TOTAL'";

        // pmn  Scenario #	Scenario Name	Source Type	Release # 	Mass Released per Day (kg/day)	# of release Days per Year
        List<Object> sqlParameters = new ArrayList<>();
        sqlParameters.add(getParameter(parameters, "AssessID"));
        sqlParameters.add(getParameter(parameters, "AssessID"));
        sqlParameters.add(getParameter(parameters, "AssOpID"));
        sqlParameters.add(getParameter(parameters, "AssOpID"));
        sqlParameters.add(getParameter(parameters, "ActSort"));
        sqlParameters.add(getParameter(parameters, "ActSort"));
        sqlParameters.add(getParameter(parameters, "DualID"));
        sqlParameters.add(getParameter(parameters, "DualID"));
        List<Map<String, Object>> results = new ArrayList<>();

        try (ResultSet resultSet = runQuery(connection, sql, sqlParameters)) {
            while (resultSet.next()) {
                HashMap<String, Object> result = new HashMap<>();

                // add all columns to result
                for (int i = 1; i <= resultSet.getMetaData().getColumnCount(); i++) {
                    result.put(resultSet.getMetaData().getColumnName(i), resultSet.getObject(i));
                }

                // split results on Media field
                String media = (String) result.get("Media");
                if (media != null) {
                    for (String item : media.split("\\s+or\\s+")) {
                        HashMap<String, Object> mediaResult = new HashMap<>(result);
                        mediaResult.put("Media", item);
                        results.add(mediaResult);
                    }
                } else {
                    results.add(result);
                }
            }
        }

        return results;
    }
    public static ResultSet runQuery(Connection connection, String sql, List<Object> params) throws SQLException {
        PreparedStatement statement = connection.prepareStatement(sql);
        for (int i = 0; i < params.size(); i++) {
            statement.setObject(i + 1, params.get(i));
        }
        statement.execute();
        return statement.getResultSet();
    }
    private static String getParameter(Map<String, String[]> parameters, String name) {
        String[] values = parameters.get(name);
        if (values == null || values.length == 0 || values[0] == null || values[0].isEmpty())
            return "";
        return values[0];
    }
    private static List<String> getValues(Connection connection, String sql) throws SQLException {
        ResultSet resultSet = runQuery(connection, sql, new ArrayList<>());
        List<String> options = new ArrayList<>();
        while (resultSet.next()) {
            options.add(resultSet.getString(1));
        }
        return options;
    }
}
