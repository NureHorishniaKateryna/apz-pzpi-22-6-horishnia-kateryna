package ua.nure.apz.adapters;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import java.util.List;

import ua.nure.apz.R;
import ua.nure.apz.api.ScheduleItem;

public class ScheduleAdapter extends RecyclerView.Adapter<ScheduleAdapter.ScheduleViewHolder> {

    public interface DeleteCallback {
        void onDelete(long scheduleId, int position);
    }

    private final List<ScheduleItem> items;
    private final DeleteCallback deleteCallback;
    private final Context context;

    public ScheduleAdapter(List<ScheduleItem> items, DeleteCallback deleteCallback, Context context) {
        this.items = items;
        this.deleteCallback = deleteCallback;
        this.context = context;
    }

    @NonNull
    @Override
    public ScheduleViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_schedule, parent, false);
        return new ScheduleViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ScheduleViewHolder holder, int position) {
        ScheduleItem item = items.get(position);
        // TODO: handle minutes on backend
        holder.idText.setText(String.format(context.getString(R.string.id_fmt), item.getId()));
        holder.startText.setText(String.format(context.getString(R.string.start_time_fmt), item.getStart(), 0));
        holder.endText.setText(String.format(context.getString(R.string.end_time_fmt), item.getEnd(), 0));

        holder.deleteButton.setOnClickListener(v -> deleteCallback.onDelete(item.getId(), position));
    }

    @Override
    public int getItemCount() {
        return items.size();
    }

    static class ScheduleViewHolder extends RecyclerView.ViewHolder {
        TextView idText, startText, endText;
        Button deleteButton;

        public ScheduleViewHolder(@NonNull View itemView) {
            super(itemView);
            idText = itemView.findViewById(R.id.scheduleId);
            startText = itemView.findViewById(R.id.scheduleStart);
            endText = itemView.findViewById(R.id.scheduleEnd);
            deleteButton = itemView.findViewById(R.id.deleteButton);
        }
    }
}

