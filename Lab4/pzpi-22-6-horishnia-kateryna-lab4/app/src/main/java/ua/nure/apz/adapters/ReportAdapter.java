package ua.nure.apz.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import java.text.DateFormat;
import java.util.Date;
import java.util.List;

import ua.nure.apz.R;
import ua.nure.apz.api.DeviceReport;

public class ReportAdapter extends RecyclerView.Adapter<ReportAdapter.ReportViewHolder> {
    private static final DateFormat DATE_FMT = DateFormat.getDateTimeInstance();

    private final List<DeviceReport> reports;

    public ReportAdapter(List<DeviceReport> reports) {
        this.reports = reports;
    }

    public void addReports(List<DeviceReport> newReports) {
        int start = reports.size();
        reports.addAll(newReports);
        notifyItemRangeInserted(start, newReports.size());
    }

    @NonNull
    @Override
    public ReportViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_report, parent, false);
        return new ReportViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ReportViewHolder holder, int position) {
        DeviceReport report = reports.get(position);
        holder.statusTextView.setText(report.isEnabled() ? "Turned On" : "Turned Off");
        holder.timeTextView.setText(DATE_FMT.format(new Date(report.getTime() * 1000)));
    }

    @Override
    public int getItemCount() {
        return reports.size();
    }

    static class ReportViewHolder extends RecyclerView.ViewHolder {
        TextView statusTextView;
        TextView timeTextView;

        public ReportViewHolder(@NonNull View itemView) {
            super(itemView);
            statusTextView = itemView.findViewById(R.id.statusTextView);
            timeTextView = itemView.findViewById(R.id.timeTextView);
        }
    }
}
