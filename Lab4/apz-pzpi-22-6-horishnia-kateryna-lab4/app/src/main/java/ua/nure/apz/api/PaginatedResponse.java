package ua.nure.apz.api;

import java.util.List;

public class PaginatedResponse<T> {
    public int count;
    public List<T> result;
}
