import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Jan", contributions: 4000 },
  { name: "Feb", contributions: 3000 },
  { name: "Mar", contributions: 5000 },
  { name: "Apr", contributions: 4500 },
  { name: "May", contributions: 6000 },
  { name: "Jun", contributions: 5500 },
];

export function ContributionChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contribution Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="contributions" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}