package com.college.bus.tracker.util;

public final class Constants {

    private Constants() {
    }

    public static final String BUS_LOCATION_TOPIC_PREFIX = "/topic/bus/";
    public static final String BUS_LOCATION_TOPIC_SUFFIX = "/location";
    public static final String DEFAULT_BUS_LOCATION_TOPIC = "/topic/bus/1/location";

    public static final String ROLE_ADMIN = "ADMIN";
    public static final String ROLE_DRIVER = "DRIVER";
    public static final String ROLE_STUDENT = "STUDENT";
}
