# note that we're inlining the build cache into the image (eg: for ci/cd)
# this means no multistage builds (for now)

FROM container-registry.oracle.com/middleware/weblogic:12.2.1.4-slim

USER root

RUN yum-config-manager --enable ol7_optional_latest \
 && yum -y update \
 && yum makecache fast \
 && yum -y install \
    maven \
 && yum clean all

RUN mkdir -p /resources \
 && chown oracle:oracle /resources

USER oracle

ENV ADMINISTRATION_PORT_ENABLED=false

ENV PRODUCTION_MODE=dev

ENV PROPERTIES_FOLDER=${ORACLE_HOME}/properties

ENV PROPERTIES_FILE=${PROPERTIES_FOLDER}/domain.properties

ENV DOMAIN_HOME=${ORACLE_HOME}/user_projects/domains/${DOMAIN_NAME}

ENV CLASSPATH=${CLASSPATH}:${ORACLE_HOME}/wlserver/server/lib/weblogic.jar 

ARG USER=user

ARG PASS=password1

RUN mkdir -p ${PROPERTIES_FOLDER} \
 && touch ${PROPERTIES_FILE} \
 && echo "username=${USER}" >> ${PROPERTIES_FILE} \
 && echo "password=${PASS}" >> ${PROPERTIES_FILE} \
 && wlst.sh -skipWLSModuleScanning -loadProperties $PROPERTIES_FILE /u01/oracle/create-wls-domain.py \
 && mkdir -p ${DOMAIN_HOME}/servers/${ADMIN_NAME}/security/ \
 && chmod -R g+w ${DOMAIN_HOME} \
 && echo "username=${USER}" >> $DOMAIN_HOME/servers/${ADMIN_NAME}/security/boot.properties \
 && echo "password=${PASS}" >> $DOMAIN_HOME/servers/${ADMIN_NAME}/security/boot.properties \
 && ${DOMAIN_HOME}/bin/setDomainEnv.sh

RUN mkdir -p ${ORACLE_HOME}/build /resources

WORKDIR ${ORACLE_HOME}/build

COPY --chown=oracle:oracle . iioac

RUN pushd iioac \
 && mvn clean compile test package \
 && cp target/iioac-1.0-SNAPSHOT.war ${DOMAIN_HOME}/autodeploy/iioac-1.0-SNAPSHOT.war \
 && popd \
 && rm -rf iioac

COPY --chown=oracle:oracle src/main/resources/iioac.mdb /resources/iioac.mdb

WORKDIR ${ORACLE_HOME}

COPY --chown=oracle:oracle ./weblogic-entrypoint.sh ${ORACLE_HOME}

RUN chmod +x ${ORACLE_HOME}/weblogic-entrypoint.sh

ENTRYPOINT ["/u01/oracle/weblogic-entrypoint.sh"]