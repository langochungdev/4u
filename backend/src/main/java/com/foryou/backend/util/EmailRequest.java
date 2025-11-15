package com.foryou.backend.util;

import java.util.List;
import java.util.ArrayList;

public class EmailRequest {
    private String to;
    private List<String> cc;
    private List<String> bcc;
    private String subject;
    private String content;
    private boolean isHtml;
    private List<Attachment> attachments;

    public static class Attachment {
        private String filename;
        private String content;
        private String type;
        private String disposition;

        public Attachment(String filename, String content, String type, String disposition) {
            this.filename = filename;
            this.content = content;
            this.type = type;
            this.disposition = disposition;
        }

        public String getFilename() { return filename; }
        public String getContent() { return content; }
        public String getType() { return type; }
        public String getDisposition() { return disposition; }
    }

    private EmailRequest(Builder builder) {
        this.to = builder.to;
        this.cc = builder.cc;
        this.bcc = builder.bcc;
        this.subject = builder.subject;
        this.content = builder.content;
        this.isHtml = builder.isHtml;
        this.attachments = builder.attachments;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String to;
        private List<String> cc = new ArrayList<>();
        private List<String> bcc = new ArrayList<>();
        private String subject;
        private String content;
        private boolean isHtml = false;
        private List<Attachment> attachments = new ArrayList<>();

        public Builder to(String to) {
            this.to = to;
            return this;
        }

        public Builder cc(String cc) {
            this.cc.add(cc);
            return this;
        }

        public Builder bcc(String bcc) {
            this.bcc.add(bcc);
            return this;
        }

        public Builder subject(String subject) {
            this.subject = subject;
            return this;
        }

        public Builder content(String content) {
            this.content = content;
            return this;
        }

        public Builder isHtml(boolean isHtml) {
            this.isHtml = isHtml;
            return this;
        }

        public Builder attachment(Attachment attachment) {
            this.attachments.add(attachment);
            return this;
        }

        public EmailRequest build() {
            return new EmailRequest(this);
        }
    }

    public String getTo() { return to; }
    public List<String> getCc() { return cc; }
    public List<String> getBcc() { return bcc; }
    public String getSubject() { return subject; }
    public String getContent() { return content; }
    public boolean isHtml() { return isHtml; }
    public List<Attachment> getAttachments() { return attachments; }
}