CREATE TABLE "flight_search_cache" (
	"id" serial PRIMARY KEY NOT NULL,
	"origin_code" text NOT NULL,
	"dest_code" text NOT NULL,
	"departure_date" date NOT NULL,
	"result_json" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
