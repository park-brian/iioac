
package gov.epa;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class ApiServlet extends HttpServlet {
    private Connection connection;
    private Gson gson;

    public void init(ServletConfig config) throws ServletException {
        super.init(config);
        setGson(new GsonBuilder()
                .setPrettyPrinting()
                .serializeNulls()
                .create());

        try {
            Class.forName("net.ucanaccess.jdbc.UcanaccessDriver");
            String databasePath = "/resources/iioac.mdb"; // todo: retrieve from context root
            String connectionUrl = "jdbc:ucanaccess://" + databasePath;
            setConnection(DriverManager.getConnection(connectionUrl));
        } catch (Exception exception) {
            exception.printStackTrace();
            throw new ServletException(exception);
        }
    }

    @Override
    public void destroy() {
        super.destroy();
        try {
            if (connection != null)
                connection.close();
        } catch (SQLException sqlException) {
            sqlException.printStackTrace();
        }
    }

    public Connection getConnection() {
        return connection;
    }

    public void setConnection(Connection connection) {
        this.connection = connection;
    }

    public Gson getGson() {
        return gson;
    }

    public void setGson(Gson gson) {
        this.gson = gson;
    }
}
