import { i as __toESM } from "../_runtime.mjs";
import { B as supabase } from "./supabase-DXZNSXc4.mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { Rt as Download, ct as LoaderCircle, i as Wifi, kt as FileText } from "../_libs/lucide-react.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-xVPC106M.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
import { O as View, _ as Page, o as Document, w as Text } from "../_libs/@react-pdf/image+[...].mjs";
import { n as pdf, t as StyleSheet } from "../_libs/react-pdf__renderer.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/cashier.receipts-C1N7wSo4.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
async function fetchFinancialReceipts(limit = 100) {
	const { data, error } = await supabase.from("fin_transaction_receipts").select("*").order("issued_at", { ascending: false }).limit(limit);
	if (error) throw error;
	return data || [];
}
var styles = StyleSheet.create({
	page: {
		padding: 36,
		fontSize: 9,
		fontFamily: "Helvetica",
		color: "#111"
	},
	title: {
		textAlign: "center",
		fontSize: 16,
		fontFamily: "Helvetica-Bold",
		marginBottom: 16
	},
	subtitle: {
		textAlign: "center",
		fontSize: 8,
		color: "#555",
		marginBottom: 14
	},
	grid: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 12
	},
	column: { width: "48%" },
	row: {
		flexDirection: "row",
		marginBottom: 5
	},
	label: {
		width: 105,
		fontFamily: "Helvetica-Bold"
	},
	value: { flex: 1 },
	tableHeader: {
		flexDirection: "row",
		backgroundColor: "#333",
		color: "#fff",
		padding: 5
	},
	tableRow: {
		flexDirection: "row",
		borderBottomWidth: .5,
		borderBottomColor: "#ccc",
		paddingVertical: 5
	},
	c1: { width: 30 },
	c2: { width: 90 },
	c3: { flex: 1 },
	c4: {
		width: 70,
		textAlign: "right"
	},
	c5: {
		width: 70,
		textAlign: "right"
	},
	total: {
		marginTop: 12,
		padding: 8,
		backgroundColor: "#f2f2f2",
		flexDirection: "row",
		justifyContent: "flex-end"
	},
	totalLabel: {
		fontFamily: "Helvetica-Bold",
		marginRight: 20
	},
	totalValue: {
		fontFamily: "Helvetica-Bold",
		fontSize: 12
	},
	footer: {
		position: "absolute",
		bottom: 30,
		left: 36,
		right: 36,
		textAlign: "center",
		fontSize: 8,
		color: "#777"
	}
});
function formatAmount(amount, currency) {
	return `${currency} ${Number(amount || 0).toLocaleString(void 0, {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	})}`;
}
function amountInWords(amount, currency) {
	const ones = [
		"",
		"One",
		"Two",
		"Three",
		"Four",
		"Five",
		"Six",
		"Seven",
		"Eight",
		"Nine",
		"Ten",
		"Eleven",
		"Twelve",
		"Thirteen",
		"Fourteen",
		"Fifteen",
		"Sixteen",
		"Seventeen",
		"Eighteen",
		"Nineteen"
	];
	const tens = [
		"",
		"",
		"Twenty",
		"Thirty",
		"Forty",
		"Fifty",
		"Sixty",
		"Seventy",
		"Eighty",
		"Ninety"
	];
	const whole = Math.floor(Math.abs(amount));
	const helper = (n) => {
		if (n < 20) return ones[n];
		if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ` ${ones[n % 10]}` : "");
		if (n < 1e3) return `${ones[Math.floor(n / 100)]} Hundred${n % 100 ? ` ${helper(n % 100)}` : ""}`;
		if (n < 1e6) return `${helper(Math.floor(n / 1e3))} Thousand${n % 1e3 ? ` ${helper(n % 1e3)}` : ""}`;
		return `${helper(Math.floor(n / 1e6))} Million${n % 1e6 ? ` ${helper(n % 1e6)}` : ""}`;
	};
	return `${helper(whole) || "Zero"} ${currency} Only`;
}
function buildFinancialReceiptData(receipt) {
	const payload = receipt.receipt_payload || {};
	return {
		receipt,
		payload,
		lines: Array.isArray(payload.lines) ? payload.lines : []
	};
}
function FinancialReceiptDocument({ receipt }) {
	const { payload, lines } = buildFinancialReceiptData(receipt);
	const voucherNumber = String(payload.voucher_number || receipt.voucher_id || "-");
	const eventType = String(payload.event_type || receipt.receipt_category || "-");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Document, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Page, {
		size: "A4",
		style: styles.page,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
				style: styles.title,
				children: "FINANCIAL TRANSACTION RECEIPT"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
				style: styles.subtitle,
				children: "Official electronically generated financial transaction acknowledgement"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(View, {
				style: styles.grid,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(View, {
					style: styles.column,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(View, {
							style: styles.row,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
								style: styles.label,
								children: "Receipt No."
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
								style: styles.value,
								children: receipt.receipt_no
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(View, {
							style: styles.row,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
								style: styles.label,
								children: "Transaction Type"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
								style: styles.value,
								children: eventType
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(View, {
							style: styles.row,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
								style: styles.label,
								children: "Category"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
								style: styles.value,
								children: receipt.receipt_category
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(View, {
							style: styles.row,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
								style: styles.label,
								children: "Direction"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
								style: styles.value,
								children: receipt.direction
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(View, {
							style: styles.row,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
								style: styles.label,
								children: "Reference"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
								style: styles.value,
								children: receipt.reference_no || receipt.instrument_reference || "-"
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(View, {
					style: styles.column,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(View, {
							style: styles.row,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
								style: styles.label,
								children: "Receipt Date"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
								style: styles.value,
								children: receipt.receipt_date
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(View, {
							style: styles.row,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
								style: styles.label,
								children: "Voucher No."
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
								style: styles.value,
								children: voucherNumber
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(View, {
							style: styles.row,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
								style: styles.label,
								children: "Payment Method"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
								style: styles.value,
								children: receipt.payment_method || "-"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(View, {
							style: styles.row,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
								style: styles.label,
								children: "Source"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
								style: styles.value,
								children: receipt.source_type || "-"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(View, {
							style: styles.row,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
								style: styles.label,
								children: "Status"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
								style: styles.value,
								children: receipt.status
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(View, {
				style: styles.tableHeader,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
						style: [styles.c1, { fontFamily: "Helvetica-Bold" }],
						children: "#"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
						style: [styles.c2, { fontFamily: "Helvetica-Bold" }],
						children: "Account"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
						style: [styles.c3, { fontFamily: "Helvetica-Bold" }],
						children: "Description"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
						style: [styles.c4, { fontFamily: "Helvetica-Bold" }],
						children: "Debit"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
						style: [styles.c5, { fontFamily: "Helvetica-Bold" }],
						children: "Credit"
					})
				]
			}),
			lines.map((line, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(View, {
				style: styles.tableRow,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
						style: styles.c1,
						children: line.line_number || index + 1
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Text, {
						style: styles.c2,
						children: [line.account_code || "-", line.account_name ? ` - ${line.account_name}` : ""]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
						style: styles.c3,
						children: line.description || receipt.description || "-"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
						style: styles.c4,
						children: Number(line.debit || 0) ? formatAmount(Number(line.debit), receipt.currency_code) : "-"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
						style: styles.c5,
						children: Number(line.credit || 0) ? formatAmount(Number(line.credit), receipt.currency_code) : "-"
					})
				]
			}, `${line.line_number}-${index}`)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(View, {
				style: styles.total,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
					style: styles.totalLabel,
					children: "Transaction Amount"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
					style: styles.totalValue,
					children: formatAmount(receipt.amount, receipt.currency_code)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(View, {
				style: { marginTop: 10 },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
					style: {
						fontFamily: "Helvetica-Bold",
						marginBottom: 4
					},
					children: "Amount in Words"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, { children: amountInWords(receipt.amount, receipt.currency_code) })]
			}),
			receipt.description && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("VIEW", {
				style: { marginTop: 10 },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("TEXT", {
					style: {
						fontFamily: "Helvetica-Bold",
						marginBottom: 4
					},
					children: "Description"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("TEXT", { children: receipt.description })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
				style: styles.footer,
				children: "This receipt is generated from the posted accounting transaction and is retained as financial evidence. It does not create a separate accounting entry."
			})
		]
	}) });
}
async function generateFinancialReceiptBlob(receipt) {
	return pdf(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FinancialReceiptDocument, { receipt })).toBlob();
}
function ReceiptsPage() {
	const [financialReceipts, setFinancialReceipts] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		loadFinancialReceipts();
	}, []);
	async function loadFinancialReceipts() {
		setLoading(true);
		try {
			setFinancialReceipts(await fetchFinancialReceipts());
		} catch (error) {
			console.error("Failed to load generated financial receipts", error);
			setFinancialReceipts([]);
		} finally {
			setLoading(false);
		}
	}
	const handleDownload = async (receipt) => {
		try {
			const blob = await generateFinancialReceiptBlob(receipt);
			const url = URL.createObjectURL(blob);
			const anchor = document.createElement("a");
			anchor.href = url;
			anchor.download = `Financial_Receipt_${receipt.receipt_no}.pdf`;
			document.body.appendChild(anchor);
			anchor.click();
			document.body.removeChild(anchor);
			URL.revokeObjectURL(url);
		} catch (error) {
			console.error(error);
			alert("Failed to generate financial receipt PDF.");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-lg font-semibold",
			children: "Financial Receipts"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "System-generated receipts for posted financial transactions. Receipts cannot be created or edited directly from this screen."
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
			className: "py-4 border-b border-border",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base font-semibold",
					children: "System-Generated Financial Receipts"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "One immutable receipt is generated by the database for every posted accounting event." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
					variant: "outline",
					className: "gap-1 text-green-700 border-green-300 bg-green-50",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wifi, { className: "h-3 w-3" }), "Live Sync"]
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "p-0",
			children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex h-32 items-center justify-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-5 w-5 animate-spin text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm text-muted-foreground",
					children: "Loading financial receipts..."
				})]
			}) : financialReceipts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "py-10 text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "mx-auto mb-3 h-8 w-8 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "No system-generated financial receipts found."
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "bg-muted/10 text-left text-xs text-muted-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 font-medium",
								children: "Receipt No."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 font-medium",
								children: "Category"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 font-medium",
								children: "Direction"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 font-medium",
								children: "Date"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 font-medium",
								children: "Reference"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 font-medium",
								children: "Payment Method"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 font-medium text-right",
								children: "Amount"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 font-medium text-right",
								children: "Status"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 font-medium text-right",
								children: "Action"
							})
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
						className: "divide-y divide-border",
						children: financialReceipts.map((receipt) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "hover:bg-muted/10",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 font-mono text-xs font-semibold",
									children: receipt.receipt_no
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 text-xs",
									children: receipt.receipt_category
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 text-xs",
									children: receipt.direction
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 text-xs text-muted-foreground",
									children: receipt.receipt_date
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 text-xs text-muted-foreground",
									children: receipt.reference_no || receipt.instrument_reference || "-"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 text-xs",
									children: receipt.payment_method || "-"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-4 py-3 text-right font-semibold",
									children: [
										receipt.currency_code,
										" ",
										Number(receipt.amount).toLocaleString()
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 text-right",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "outline",
										className: "text-green-700 border-green-300 bg-green-50 text-xs",
										children: receipt.status
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 text-right",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "outline",
										size: "sm",
										className: "gap-1",
										onClick: () => void handleDownload(receipt),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5" }), "PDF"]
									})
								})
							]
						}, receipt.id))
					})]
				})
			})
		})] })]
	});
}
//#endregion
export { ReceiptsPage as component };
