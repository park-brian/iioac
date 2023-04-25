
package gov.epa;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.Writer;
import java.util.List;
import java.util.Map;

@WebServlet("/api/status")
public class StatusServlet extends ApiServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try(Writer responseWriter = response.getWriter()) {
            boolean results = DataAccess.getStatus(this.getConnection());
            response.setHeader("Access-Control-Allow-Origin", "*");
            response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
            response.setHeader("Access-Control-Allow-Headers", "Content-Type");
            response.setHeader("content-type", "application/json");
            responseWriter.write(this.getGson().toJson(results));
        } catch (Exception exception) {
            exception.printStackTrace();
            response.sendError(500, exception.getMessage());
        }
    }
}
