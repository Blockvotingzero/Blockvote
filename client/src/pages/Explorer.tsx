
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { type Vote, type Candidate } from "@shared/schema";

export default function Explorer() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 20;
  
  const { data: votes } = useQuery<Vote[]>({
    queryKey: ["/api/votes"]
  });

  const { data: candidates } = useQuery<Candidate[]>({
    queryKey: ["/api/candidates"]
  });

  const isLoading = !votes || !candidates;
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getCandidateName = (candidateId: number) => {
    return candidates.find(c => c.id === candidateId)?.name || "Unknown";
  };

  const filteredVotes = votes.filter(vote => 
    vote.transactionHash.toLowerCase().includes(search.toLowerCase()) ||
    getCandidateName(vote.candidateId).toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredVotes.length / ITEMS_PER_PAGE);
  const paginatedVotes = filteredVotes.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Blockchain Explorer</h1>
        <p className="text-muted-foreground">View all transactions on the blockchain</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{votes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Block Height</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.max(...votes.map(v => v.blockHeight))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Transaction Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.5s</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <Input
            placeholder="Search by transaction hash or candidate name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction Hash</TableHead>
                <TableHead>Block Height</TableHead>
                <TableHead>Candidate</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedVotes.map((vote) => (
                <TableRow key={vote.id}>
                  <TableCell className="font-mono">
                    {vote.transactionHash.slice(0, 16)}...
                  </TableCell>
                  <TableCell>{vote.blockHeight}</TableCell>
                  <TableCell>{getCandidateName(vote.candidateId)}</TableCell>
                  <TableCell>
                    {new Date(vote.timestamp).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <div className="flex justify-between items-center mt-4">
            <Button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span>Page {page} of {totalPages}</span>
            <Button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
