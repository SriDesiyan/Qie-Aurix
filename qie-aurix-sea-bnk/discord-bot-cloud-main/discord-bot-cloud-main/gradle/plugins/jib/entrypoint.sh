#!/bin/sh

#===========================================================================================
# JVM Configuration
#===========================================================================================
if [[ "${MODE}" == "standalone" ]]; then
    JAVA_OPT="${JAVA_OPT} -Xms256m -Xmx256m"
else
  JAVA_OPT="${JAVA_OPT} -server -Xms${JVM_XMS} -Xmx${JVM_XMX} -Xmn${JVM_XMN} -XX:MetaspaceSize=${JVM_MS} -XX:MaxMetaspaceSize=${JVM_MMS}"
  if [[ "${SERVICE_DEBUG}" == "y" ]]; then
    JAVA_OPT="${JAVA_OPT} -Xdebug -Xrunjdwp:transport=dt_socket,address=9555,server=y,suspend=n"
  fi
  JAVA_OPT="${JAVA_OPT} -XX:-OmitStackTraceInFastThrow -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=${BASE_DIR}/logs/${SERVICE_NAME}/java_heapdump.hprof"
  JAVA_OPT="${JAVA_OPT} -XX:-UseLargePages"
fi

#===========================================================================================
# Setting system properties
#===========================================================================================
if [[ ! -z "${PROFILES_ACTIVE}" ]]; then
    JAVA_OPT="${JAVA_OPT} -Dspring.profiles.active=${PROFILES_ACTIVE}"
fi
if [[ ! -z "${TIME_ZONE}" ]]; then
    JAVA_OPT="${JAVA_OPT} -Duser.timezone=${TIME_ZONE}"
fi
if [[ "${SK_AGENT_EN}" == "y" ]]; then
    JAVA_OPT="${JAVA_OPT} -javaagent:/skywalking/agent/skywalking-agent.jar -Dskywalking.collector.backend_service=${SK_SERVICE} -Dskywalking.agent.service_name=${SERVICE_NAME}"
fi

#===========================================================================================
# GC properties
#===========================================================================================
OPENJDK_HOME="/usr/lib/jvm/java-1.8-openjdk"
JAVA_MAJOR_VERSION=$(java -version 2>&1 | sed -E -n 's/.* version "([0-9]*).*$/\1/p')
if [[ "$JAVA_MAJOR_VERSION" -ge "9" ]] ; then
  JAVA_OPT="${JAVA_OPT} -Xlog:gc*:file=${BASE_DIR}/logs/${SERVICE_NAME}/gc.log:time,tags:filecount=10,filesize=102400"
else
  JAVA_OPT="${JAVA_OPT} -Djava.ext.dirs=${OPENJDK_HOME}/jre/lib/ext:${OPENJDK_HOME}/lib/ext:${BASE_DIR}/plugins/cmdb"
  JAVA_OPT="${JAVA_OPT} -Xloggc:${BASE_DIR}/logs/${SERVICE_NAME}/gc.log -verbose:gc -XX:+PrintGCDetails -XX:+PrintGCDateStamps -XX:+PrintGCTimeStamps -XX:+UseGCLogFileRotation -XX:NumberOfGCLogFiles=10 -XX:GCLogFileSize=100M"
fi
#===========================================================================================
# fix bug ===> need remove in future
#===========================================================================================
# https://github.com/apache/rocketmq/issues/667
LOCAL_HOSTNAME="`hostname`"
JAVA_OPT="${JAVA_OPT} -Drocketmq.client.name=${LOCAL_HOSTNAME}"

#===========================================================================================
# Start properties
#===========================================================================================
JAVA_OPT="${JAVA_OPT} -Dlogging.path=${BASE_DIR}/logs"
JAVA_OPT="${JAVA_OPT} -Djava.security.egd=file:/dev/./urandom -cp /app/resources/:/app/classes/:/app/libs/* ${APP_MAIN_CLASS}"

if [[ "${WAIT_SERVER}" == "mysql" ]]; then
  echo "/wait-for-it.sh ${MYSQL_DATABASE_HOST}:${MYSQL_DATABASE_PORT} -t 0 -s"
  exec /wait-for-it.sh ${MYSQL_DATABASE_HOST}:${MYSQL_DATABASE_PORT} -t 0 -s -- java ${JAVA_OPT}
elif [[ "${WAIT_SERVER}" == "nacos" ]]; then
  echo "/wait-for-it.sh ${SERVICE_VIP}:8848 -t 0 -s "
  exec /wait-for-it.sh ${SERVICE_VIP}:8848  -t 0 -s -- java ${JAVA_OPT}
else
  echo "java ${JAVA_OPT}"
  exec java ${JAVA_OPT}
fi

#===========================================================================================
# Service debug
#===========================================================================================

if [[ "${SERVICE_DEBUG}" == "y" ]]; then
  JAVA_OPT="${JAVA_OPT} -Xdebug -Xrunjdwp:transport=dt_socket,address=9555,server=y,suspend=n"
fi